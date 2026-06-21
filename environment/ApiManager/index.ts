export const BaseUrl = "http://192.168.29.53:8000/"
// export const BaseUrl = "http://readytoride.in/";
export const Google_map = "AIzaSyCATOPiFqH1MavVSTy_TKSZ3hfK8II3Www";

export const AppID = "46dfcca1-f6d9-45b6-9217-4897e505ab4a";

export const PartnerUser = "partner-user/";
export const ForgetTable = "forget/";
export const bookingTable = "booking/";
export const verificationTable = "partner-verification/";
export const paymentBase = "payment";

export const Auth = {
    signupapi : "partner-createUser",
    loginapi : "partner-login",
    verifyemailapi : "partner-confirmEmail",
    verifyotpapi : "partner-verifyEmail",
    updateUser: "partner-updateUser"
};

export const forget = {
    verifyEmail : "forget-password",
    verifyOtp : "verifyOtp",
    forgetPassword : "reset-password"
};

export const bookings = {
    allBooking : "allBookingList",
    updateBooking : "updateBooking",
    acceptBooking : "selectBooking",
    acceptList : 'driverBookings',
    cancelbooking: 'cancelBooking'
};

export const verificationDetails = {
    verifyDetails : "verification-details"
}

export const ridersForm = {
    startRide : "startRide",
    endRide : "completeRide"
}

export const wallet = {
    transactions_history : "/user-transactions" 
}

export const referalApi = {
    referal_history: 'referral/history'
}