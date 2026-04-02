"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCT = exports.MODEL = exports.FAQ = exports.CONTENT = exports.AUTH = exports.SUCCESS = exports.ERROR = exports.EMAILTEMPLATE = exports.SUBADMIN = exports.USER = exports.ADMIN = void 0;
exports.ADMIN = {
    emailExists: "Email already exists.",
    phoneNumberExists: "Phone number already exists.",
    adminAdded: "Admin Added.",
    invalidLogin: "Invalid credentials.",
    profileUpdated: "Profile updated successfully.",
    loginSuccess: "Login Successfully.",
    emailNotExists: "Email doesn't exist.",
    accountNotExists: "Account doesn't exist.",
    emailSent: "Email sent successfully.",
    passwordNotSame: "Confirm password should be the same as new password.",
    resetLinkExpired: "Reset Password link has expired.",
    resetPasswordSuccess: "Password reset successfully.",
    passwordNotMatched: "Confirm password not matched.",
    passwordInvalid: "Old password is invalid.",
    passwordChanged: "Password changed successfully.",
    settingUpdated: "Setting updated successfully.",
    subadminAdded: "Subadmin added successfully.",
    subadminUpdated: "Subadmin updated successfully.",
    subadminActivated: "Subadmin activated successfully.",
    subadminDeactivated: "Subadmin deactivated successfully.",
    subadminDeleted: "Subadmin deleted successfully.",
};
exports.USER = {
    emailAlreadyExists: "Email already exists.",
    phoneNumberExists: "Phone number already exists.",
    otpSent: "We've sent a new OTP to your registered contact.",
    verificationLinkSent: "We've sent a new link to your registered email.",
    otpExpired: "OTP expired.",
    otpNotMatched: "Invalid OTP.",
    otpVerified: "OTP verified.",
    accountNotExists: "Your account does not exist.",
    accountDeactivated: "Your account has been deactivated. Please contact the admin for further assistance.",
    accountNotApproved: "Your account has not been approved yet.",
    invalidLogin: "Invalid credentials.",
    passwordInvalid: "Invalid password.",
    loginSuccess: "Login successful.",
    singUpSuccess: "Your account has been created successfully.",
    resetPassword: "Password reset successfully.",
    documentUploaded: "Your documents have been submitted successfully. You will be notified once it is approved.",
    userAdded: "User added successfully.",
    userUpdated: "User updated successfully.",
    userActivated: "User activated successfully.",
    userDeactivated: "User deactivated successfully.",
    userDeleted: "User deleted successfully.",
    accountNotVerified: "Please verify your account first.",
    accountNotCompleted: "Please complete your account first.",
    socialLoginTypeRequired: "Social login type is required.",
    contactUsSubmitted: "Your feedback has been submitted successfully.",
    profileUpdated: "Profile updated successfully.",
    passwordNotMatched: "Confirm password does not match.",
    oldPasswordInvalid: "Old password is invalid.",
    passwordChanged: "Password changed successfully.",
    guestUserCreated: "Guest user created successfully.",
    identityVerification: "Your account has been submitted for verification. You will be notified once it is approved.",
    usernameAlreadyExist: "Username already exists.",
    invalidToken: "Invalid or tampered token. Please request a new password reset link."
};
exports.SUBADMIN = {
    subAdminAdded: "Subadmin added successfully.",
    subAdminUpdated: "Subadmin updated successfully.",
    subAdminActivated: "Subadmin activated successfully.",
    subAdminDeactivated: "Subadmin deactivated successfully.",
    subAdminsDeleted: "Subadmin deleted successfully.",
    profileUpdated: "Subadmin updated successfully.",
    emailAlreadyExists: "Email already exists."
};
exports.EMAILTEMPLATE = {
    templateAdded: "Email template added successfully.",
    templateUpdated: "Email template updated successfully.",
    emailSent: "Email sent.",
    templateActived: "Email template activated successfully.",
    templateInactived: "Email template deactivated successfully.",
    templateDeleted: "Email template deleted successfully."
};
exports.ERROR = {
    SomethingWrong: "Oops, something went wrong. Please try again later.",
    NoDataFound: "No data found."
};
exports.SUCCESS = {
    dataFound: "Data found."
};
exports.AUTH = {
    tokenRequired: "A token is required for authentication!",
    adminDeleted: "Admin Deleted.",
    adminDeactived: "Your account has been deactivated.",
    invalidToken: "Invalid Token, Not authorized to access.",
    tokenExpired: "Token Expired!",
    userDeleted: "Your account has been deleted by admin."
};
exports.CONTENT = {
    contentAdded: "Content added successfully.",
    contentUpdated: "Content updated successfully.",
    privacyUpdated: "Privacy policy updated successfully.",
    termsUpdated: "Terms & conditions updated successfully.",
    aboutUpdated: "About Us updated successfully.",
    welcomeUpdated: "App welcome screen updated successfully.",
    communityGuidelinesUpdated: "Community guidelines updated successfully.",
    userActivated: "Content activated successfully.",
    userDeactivated: "Content deactivated successfully.",
};
exports.FAQ = {
    faqAdded: "FAQ added successfully.",
    faqUpdated: "FAQ updated successfully.",
    faqDeleted: "FAQ deleted successfully.",
    faqActivated: "FAQ activated successfully.",
    faqDeactivated: "FAQ deactivated successfully."
};
exports.MODEL = {
    notFound: "Model Not Found",
    modelupdated: "Model update SuccessFully.",
    modelAdded: "Model added successfully.",
    found: "Model found SuccessFully.",
    modelDeleted: "Model Delete SuccessFully."
};
exports.PRODUCT = {
    productAdded: "Product added successfully.",
    productUpdated: "Product updated successfully.",
    productDeleted: "Product deleted successfully.",
    productFound: "Product found successfully.",
    productNotFound: "Product not found.",
    bulkUploadSuccess: "Bulk upload completed successfully.",
    invalidData: "Invalid data provided.",
};
