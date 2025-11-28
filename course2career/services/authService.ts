
import type { User, UserType, UserProfile, Job } from '../types';

const USERS_DB_KEY = 'course2career_users';
const CURRENT_USER_KEY = 'course2career_current_user';

// Helper to get all users from our simulated DB (localStorage)
const getAllUsers = (): User[] => {
    try {
        const users = localStorage.getItem(USERS_DB_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error("Failed to parse users from localStorage", error);
        return [];
    }
};

// Helper to save all users to our simulated DB
const saveAllUsers = (users: User[]) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

/**
 * Simulates user registration.
 * @param email - The user's email.
 * @param password - The user's password.
 * @param userType - The type of user ('seeker' or 'employer').
 * @param extraData - Additional data like fullName or companyName.
 * @returns The newly created user object if successful.
 * @throws An error if the email is already registered.
 */
export const registerUser = (
    email: string, 
    password: string, 
    userType: UserType, 
    extraData: { 
        fullName?: string; 
        phone?: string;
        dateOfBirth?: string;
        companyName?: string;
        companyWebsite?: string;
        employeeCount?: string;
    }
): User => {
    const users = getAllUsers();
    
    // Check for uniqueness
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        throw new Error('An account with this email already exists.');
    }

    const newUser: User = { email, password, userType };
    users.push(newUser);
    saveAllUsers(users);

    // Save extra data specific to the user type. This mimics having separate profiles.
    if (userType === 'seeker' && extraData.fullName) {
        // We create a minimal profile here. The full profile is created via the parser.
        const seekerProfile = { 
            fullName: extraData.fullName, 
            email, 
            phone: extraData.phone || '', 
            dateOfBirth: extraData.dateOfBirth || '',
            summary: '', 
            skills: [], 
            experience: [], 
            education: {} 
        };
        localStorage.setItem(`userProfile_${email}`, JSON.stringify(seekerProfile));
    } else if (userType === 'employer' && extraData.companyName) {
        const employerProfile = { 
            companyName: extraData.companyName, 
            email,
            companyWebsite: extraData.companyWebsite || '',
            employeeCount: extraData.employeeCount || '',
        };
        localStorage.setItem(`employerProfile_${email}`, JSON.stringify(employerProfile));
    }


    // Automatically log in the user after registration
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ email, userType }));
    
    return { email, userType };
};

/**
 * Simulates user login.
 * @param email - The user's email.
 * @param password - The user's password.
 * @param userType - The type of user attempting to log in.
 * @returns The user object if credentials are valid.
 * @throws An error for invalid credentials or incorrect user type.
 */
export const loginUser = (email: string, password: string, userType: UserType): User => {
    const users = getAllUsers();
    const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );

    if (!user) {
        throw new Error('Invalid email or password.');
    }

    if (user.userType !== userType) {
        throw new Error(`This email is registered as a ${user.userType}. Please log in on the correct page.`);
    }

    const loggedInUser: User = { email: user.email, userType: user.userType };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInUser));

    return loggedInUser;
};

/**
 * Logs out the current user by clearing their session data.
 */
export const logoutUser = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * Retrieves the currently logged-in user from the session.
 * @returns The current user object or null if not logged in.
 */
export const getCurrentUser = (): User | null => {
    try {
        const user = localStorage.getItem(CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Failed to parse current user from localStorage", error);
        return null;
    }
};


/**
 * Retrieves all seeker profiles from localStorage.
 * @returns An array of UserProfile objects.
 */
export const getAllSeekerProfiles = (): UserProfile[] => {
    const users = getAllUsers();
    const seekerEmails = users.filter(u => u.userType === 'seeker').map(u => u.email);
    const profiles: UserProfile[] = [];

    seekerEmails.forEach(email => {
        const profileData = localStorage.getItem(`userProfile_${email}`);
        if (profileData) {
            try {
                const profile = JSON.parse(profileData);
                // Ensure profile has at least a name and email to be considered valid
                if (profile.fullName && profile.email) {
                    profiles.push(profile);
                }
            } catch (e) {
                console.error(`Failed to parse profile for ${email}`, e);
            }
        }
    });
    return profiles;
};

/**
 * Retrieves all jobs posted by all employers from localStorage.
 * @returns An array of Job objects.
 */
export const getAllPostedJobs = (): Job[] => {
    const users = getAllUsers();
    const employerEmails = users.filter(u => u.userType === 'employer').map(u => u.email);
    let allJobs: Job[] = [];

    employerEmails.forEach(email => {
        const jobsData = localStorage.getItem(`postedJobs_${email}`);
        if (jobsData) {
            try {
                const jobs = JSON.parse(jobsData);
                if (Array.isArray(jobs)) {
                    allJobs = [...allJobs, ...jobs];
                }
            } catch (e) {
                console.error(`Failed to parse jobs for ${email}`, e);
            }
        }
    });
    return allJobs;
};
