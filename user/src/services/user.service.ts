import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { RiskToleranceLevel, User } from '@amenferjani/shared-lib';
import { CreateUserDto } from '@amenferjani/shared-lib';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { Role } from '@amenferjani/shared-lib';
import { EmailService } from './email.service';
import { JwtService } from '@nestjs/jwt';

const RiskToleranceModifier = {
    [RiskToleranceLevel.LOW]: 1,
    [RiskToleranceLevel.MEDIUM]: 2,
    [RiskToleranceLevel.HIGH]: 3,
};
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @Inject(forwardRef(() => EmailService))
        private readonly emailService: EmailService,
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        private jwtService: JwtService,
    ) { }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepo.findOne({
            where: { email },
            relations: ['role'],
        });

        if (!user) {
            console.warn(`User  with email ${email} not found.`);
        }
        return user;
    }

    async getMe(email: string): Promise<User> {
        const user = await this.findByEmail(email);
        user.password = '';
        console.log(user);
        return user;
    }

    async createRole(name: string): Promise<Role> {
        const createdRole = this.roleRepo.create({ name: name });
        return this.roleRepo.save(createdRole);
    }
    async findRoleById(roleId: string): Promise<Role> {
        const role = await this.roleRepo.findOne({ where: { id: roleId } });
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        return role;
    }
    protected async findRoleByName(name: string): Promise<Role> {
        return this.roleRepo.findOne({ where: { name } });
    }
    async getAllRoles(): Promise<Role[]> {
        const body = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #007bff;">Welcome to ShareVest!</h2>
                <p>Dear User,</p>
                <p>We are excited to have you on board. ShareVest is committed to providing you with the best investment experience.</p>
                <p>Here’s what you can do next:</p>
                <ul>
                    <li>Explore our portfolio of investment opportunities.</li>
                    <li>Track your investment performance.</li>
                    <li>Receive updates on the latest market trends.</li>
                </ul>
                <p>If you have any questions, feel free to <a href="mailto:support@sharevest.com" style="color: #007bff;">contact us</a>.</p>
                <p>Thank you for choosing ShareVest!</p>
                <p>Best regards,<br> The ShareVest Team</p>
            </div>
        `;

        // this.emailService.sendEmailNotification('amenferjani23@gmail.com','test',body)
        return this.roleRepo.find();
    }

    async addRole(id: string, roleName: string): Promise<User> {
        const user = await this.userRepo.findOne({
            where: { id },
            relations: ['role'],
        });
        if (!user) {
            console.log('no user');
            throw new NotFoundException('User not found');
        }

        if (user.role?.some((r) => r.name === roleName)) {
            console.log('user already have this role');
            return user;
        }
        const role = await this.findRoleByName(roleName);

        console.log('role :', role);
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        console.log('role added :', user);
        user.role.push(role);
        return await this.userRepo.save(user);
    }

    async verifyAccount(data: any): Promise<{ message: string }> {
        const userId = data.userId;

        if (!userId) {
            throw new BadRequestException('Missing userId');
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.isEmailVerified) {
            return { message: 'Account already verified.' };
        }

        user.isEmailVerified = true;
        await this.userRepo.save(user);

        return { message: 'Account verified successfully ✅' };
    }


    async register(createUserDto: CreateUserDto): Promise<User> {
        const { email, password } = createUserDto;

        // Check if the email is already in use
        const existingUser = await this.userRepo.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Find the default role
        // const roleId = '37d3c528-3cc4-4b9c-89d9-24fe249ce553'; // Default user role ID
        // const userRole = await this.findRoleById(roleId);

        // if (!userRole) {
        //     throw new NotFoundException('Default role not found');
        // }

        // Create the new user object
        const newUser = this.userRepo.create({
            ...createUserDto,
            role: [
                {
                    id: '37d3c528-3cc4-4b9c-89d9-24fe249ce553',
                    name: 'user',
                },
            ], // Initialize the role array with the default role
            password: hashedPassword,
        });

        // Save the user to the database
        return await this.userRepo.save(newUser);
    }

    // private generateVerificationToken(email: string): string {
    //     const secret = jwtConstants.secret;
    //     const payload = { email };

    //     return jwt.sign(payload, secret, { expiresIn: '1h' });
    // }

    // async handleVerification(email: string): Promise<void> {
    //     try {
    //         const verificationToken = this.generateVerificationToken(email);
    //         await this.emailService.sendVerificationEmail(email, verificationToken);
    //     } catch (error) {
    //         throw new Error('Failed to send verification email');
    //     }
    // }

    // Inside UserService or a dedicated EmailService
    async sendVerificationEmail(user: User): Promise<void> {
        const token = this.jwtService.sign(
            { userId: user.id, email: user.email },
            {
                secret: process.env.EMAIL_VERIFICATION_SECRET,
                expiresIn: '1h',
            },
        );

        const verifyUrl = `${process.env.APP_URL}/users/verify-email?token=${token}`;

        await this.emailService.sendEmailNotificationByEmail(
            user.email,
            'Verify Your Email - ShareVest Holdings',
            `
                <div style="background-color: #000; color: #F3F4F6; font-family: Arial, sans-serif; padding: 24px; border-radius: 8px;">
                <h2 style="color: #10B981;">Welcome to ShareVest, ${user.username} 👋</h2>
                <p>You're almost ready to access ShareVest’s exclusive investment ecosystem.</p>

                <p>Please verify your email by clicking the button below:</p>

                <a href="${verifyUrl}"
                    style="display: inline-block; margin: 20px 0; padding: 12px 24px; background-color: #10B981; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold;"
                    target="_blank">
                    ✅ Verify Email
                </a>

                <p style="font-size: 14px; color: #9CA3AF;">
                    This link is valid for 1 hour. If it expires, you can request a new one from your profile settings.
                </p>

                <hr style="margin: 32px 0; border: none; border-top: 1px solid #1F2937;" />

                <p style="font-size: 13px; color: #6B7280;">
                    ShareVest Holdings | Unified Access to Premium Investment Platforms<br/>
                    AssetVest • QuantumVest • PartVest • RiskVest • HedgeVest • PrivateVest • RelVest
                </p>
                </div>
            `,
        );
    }

    checkHealth(): string {
        return 'user service!';
    }

    async findByGoogleId(googleId: string): Promise<User | undefined> {
        console.log('find by google id ');
        return this.userRepo.findOne({
            where: { googleId },
            relations: ['role'],
        });
    }

    async getUserDetails(id: string): Promise<User> {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async calculateUserRiskMetrics(
        id: string,
    ): Promise<{ riskTolerance: number; overallRiskScore: number }> {
        const user = await this.getUserDetails(id);
        const overallRiskScore = user.overallRiskScore;
        const riskToleranceModifier = RiskToleranceModifier[user.riskTolerance];
        console.log('calculateUserRiskMetrics service tcp :', {
            riskTolerance: riskToleranceModifier,
            overallRiskScore: overallRiskScore,
        });
        return {
            riskTolerance: riskToleranceModifier,
            overallRiskScore: overallRiskScore,
        };
    }
}
