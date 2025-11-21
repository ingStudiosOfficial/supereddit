import passport from 'passport';
import { Strategy as DiscordStrategy, Profile } from 'passport-discord';
import { User, IUser } from '../models/User';

export const configurePassport = (): void => {
    passport.use(
        new DiscordStrategy(
            {
                clientID: process.env.DISCORD_CLIENT_ID!,
                clientSecret: process.env.DISCORD_CLIENT_SECRET!,
                callbackURL: process.env.DISCORD_CALLBACK_URL!,
                scope: ['identify'],
            },
            async (accessToken: string, refreshToken: string, profile: Profile, done: any) => {
                try {
                    // Find or create user
                    let user = await User.findOne({ discordId: profile.id });

                    if (!user) {
                        // Create new user
                        user = await User.create({
                            discordId: profile.id,
                            username: profile.username,
                            discriminator: profile.discriminator || '0',
                            avatar: profile.avatar || '',
                            lastLogin: new Date(),
                            loginCount: 1,
                        });
                        console.log(`✅ New user created: ${user.username}`);
                    } else {
                        // Update existing user info and track login
                        user.username = profile.username;
                        user.discriminator = profile.discriminator || '0';
                        user.avatar = profile.avatar || '';
                        user.lastLogin = new Date();
                        user.loginCount = (user.loginCount || 0) + 1;
                        await user.save();
                        console.log(`✅ User logged in: ${user.username} (${user.loginCount} logins)`);
                    }

                    return done(null, user);
                } catch (error) {
                    console.error('❌ Discord authentication error:', error);
                    return done(error, null);
                }
            }
        )
    );

    // Serialize user to session
    passport.serializeUser((user: any, done) => {
        done(null, user._id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};
