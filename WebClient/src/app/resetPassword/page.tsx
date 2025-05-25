import { ResetPasswordComponent } from "@/components/ResetPasswordComponent/ResetPasswordComponent";
import { AuthProvider } from "@/lib/providers/auth";

/**
 * Forgot password page component.
 * @returns {JSX.Element} The rendered component.
 */
export default function ForgotPasswordPage() {
    console.debug("Rendering ForgotPasswordPage");
    return (
        <AuthProvider>
            <ResetPasswordComponent />
        </AuthProvider>
    );
}
