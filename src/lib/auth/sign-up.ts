import { authClient } from "@/lib/auth-client"; //import the auth client
import { redirect } from "next/navigation";

interface signUpProps {
    email: string;
    password: string;
    name: string;
}

// 註冊
export const signUp = async (props: signUpProps) => {
    try {
        console.log('props',props)
        const { data, error } = await authClient.signUp.email({
            email: props.email,
            password: props.password,
            name: props.name,
        });
        if (data) {
            console.log(data)
            redirect('/login')
        } else {
            console.log('signUp error',error)
        }
    } catch (error) {
        console.log('await signUp error',error)
    }
};
