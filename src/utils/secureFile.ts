import { CFEnvironment, CFSession } from "cashfree-pg-api-contract";
import { showError } from "../Common/ToastMessage";
import { CFPaymentGatewayService } from "react-native-cashfree-pg-sdk";

export const convertToLowerCase = (convertValue: any = '') => {
  return ('' + convertValue).toLowerCase();
};

export const openCashfreePayment = async (orderId: string, paymentSessionId: string) => {
        try {
            if (!orderId || !paymentSessionId) {
                showError("Invalid Cashfree payment details");
                return;
            }
            const session: any = new CFSession(
                paymentSessionId,
                orderId,
                CFEnvironment.SANDBOX
            );
            
            await CFPaymentGatewayService.doWebPayment(session)

        } catch (error: any) {
            showError(
                error?.message || "Unable to open Cashfree payment"
            );
        }
    };