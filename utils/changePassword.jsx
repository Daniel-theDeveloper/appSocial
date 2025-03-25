import { auth } from "./database";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

import { setLocalUser } from "./localstorage";

export default async function ChangePassword(password, newPassword) {

    const reauthenticateUser = async () => {
        try {
            const user = auth.currentUser;

            if (!user) {
                return false;
            } else {
                const credentials = EmailAuthProvider.credential(user.email, password);
                await reauthenticateWithCredential(user, credentials);

                return true;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    const ChangePassword = async () => {
        try {
            const res = await reauthenticateUser();

            if (res) {
                const user = auth.currentUser;

                if (!user) {
                    return false;
                } else {
                    await updatePassword(user, newPassword);
                    await setLocalUser(user.email, newPassword);

                    return true;
                }
            } else {
                console.error("Error en el proceso de autenticación");
                return false;
            }
        } catch (error) {
            console.error(error.message);
            return false;
        }
    }

    return await ChangePassword();
}