export const BaseUrl = "http://10.137.76.206:8000/"
// export const BaseUrl = "http://readytoride.in/";
export const secretKeyData= "RTRPartner_30012001"
export const Google_map = "AIzaSyCATOPiFqH1MavVSTy_TKSZ3hfK8II3Www";

export const AppID = "46dfcca1-f6d9-45b6-9217-4897e505ab4a";

export const PartnerUser = "partner-user/";
export const ForgetTable = "forget/";
export const bookingTable = "booking/";
export const verificationTable = "partner-verification/";
export const paymentBase = "payment";
export const packageBase = "package";
export const FeedBackBase = "feedback";

export const Auth = {
    signupapi : "partner-createUser",
    loginapi : "partner-login",
    verifyemailapi : "partner-confirmEmail",
    verifyotpapi : "partner-verifyEmail",
    updateUser: "partner-updateUser"
};

export const UserDetailsApi = {
    me: 'me'
}

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
    cancelbooking: 'cancelBooking',
    gear_Type: 'gear-types'
};

export const verificationDetails = {
    verifyDetails : "verification-details"
}

export const ridersForm = {
    startRide : "startRide",
    endRide : "completeRide"
}

export const wallet = {
    transactions_history : "/wallet-transactions"
}

export const paymentApis = {
    cashCollect: '/cash/collect',
    cashFree: '/cashfree/create-order',
    verify: '/cashfree/verify',
    topUp: '/driver-settle',
    topUpVerify: '/verify-driver-settlement',
    bankDetails: 'bank-details',
    withdrawRequest: '/withdrawal-request',
    RequestList: '/withdrawals',
    cancelRequest: '/withdrawal-request/cancel'
}

export const referalApi = {
    referal_history: 'referral/history'
}

export const statisticsApi = {
    statistics: 'statistics'
}

export const PackageApis = {
    purchasePackage: '/purchase',
    myPackages: '/my-status',
    verifyPament: '/verify'
}

export const FeedbackApis = {
    Tags: '/tags?targetType=user',
    Submit: '/submit'
}