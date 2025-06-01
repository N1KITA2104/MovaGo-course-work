export class UserData {
    username: string;
    email: string;
    password: string;

    constructor(username: string, email: string, password: string) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}

export const testData = {
    nonExistentUser: new UserData(
        "Non Existent User",
        "nonExistent@user.com",
        "nonExistent"
    ),
    newUser: new UserData(
        "New User",
        "new@user.com",
        "Password123!"
    ),
    adminUser: new UserData(
        "Admin User",
        "admin@example.com",
        "Test123!"
    ),
    existentUser: new UserData(
        "Regular User",
        "user@example.com",
        "Test123!"
    ),
    userToDelete: new UserData(
        "User to Delete",
        "userToDelete@example.com",
        "Test123!"
    )
};