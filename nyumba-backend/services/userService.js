const User = require('../models/user');

class UserService {
    async register(userData) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const user = new User(userData);
        return user.save();
    }

    async login({ email, password }) {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (user && (await user.matchPassword(password))) {
            return user; // Return the full user object on success
        } else {
            throw new Error('Invalid email or password');
        }
    }
}
module.exports = new UserService();