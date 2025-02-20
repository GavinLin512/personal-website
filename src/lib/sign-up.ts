import { authClient } from "@/lib/auth-client"; //import the auth client
import { redirect } from "next/navigation";

export const signUpUser = async (email: string, password: string, name: string) => {
    const { data, error } = await authClient.signUp.email({
        email, // user email address
        password, // user password -> min 8 characters by default
        name, // user display name
        // image, // user image url (optional)
        // callbackURL: "/dashboard" // a url to redirect to after the user verifies their email (optional)
    }, {
        onRequest: (ctx) => {
            //show loading
            console.log('onRequest', ctx);
        },
        onSuccess: (ctx) => {
            //redirect to the dashboard or sign in page
            console.log('success', ctx);
            redirect('admin/login');
        },
        onError: (ctx) => {
            console.log('error', ctx);
            // display the error message
            alert(ctx.error.message);
        },
    });
};