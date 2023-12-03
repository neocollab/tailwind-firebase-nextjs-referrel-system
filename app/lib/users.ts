import { AuthOptions, auth } from "@/app/auth/config";
import { fetchCollection, fetchSubcollection, mutateCollection } from "@/app/lib/firebase";
import { InvitedUser, User } from "@/types/user";

export /**
 * Function will update the user object
 *
 * @param {({ email: string } & Partial<User>)} user
 * @return {*} 
 */
const updateUser = async (user: { email: string } & Partial<User>) => {
    // check if permissions are correct
    const session = await auth();
    if (session?.user?.email !== user.email) throw Error(`User ${session?.user?.email} does not have the permission to edit ${user.email}`);

    // get user snapshot
    const query = await mutateCollection("users").where("email", "==", user.email).get();
    const userSnapshot = query.docs.at(0);

    // throw error is no user
    if (!userSnapshot) throw Error(`No user object for ${user.email}`);

    // is there is a user, update it.
    return userSnapshot.ref.update(user);
}

export /**
 * Function will fetch the user with the associated email
 *
 * @param {string} email
 * @return {*}  {(Promise<User | undefined>)}
 */
const getUserWithEmail = async (email?: string | null, makePlainObject = false): Promise<Partial<User> & { id: string } | undefined> => {
    if (!email) return;
    const search = email.toLowerCase();

    // define query
    const query = fetchCollection("users").where('email', '==', search).limit(1);
    const snapshot = await query.get();

    // return user objects, making sure id is required
    const userData = snapshot.docs.map((userDoc) => ({ ...userDoc.data(), id: userDoc.id })).at(0);

    // make plain object
    if (makePlainObject) {
        delete userData?.emailVerified;
    }
    return userData;
}

export /**
 * Function will search for users with the substring
 *
 * @param {string} searchString
 * @return {*} 
 */
const searchUsers = async (searchString: string): Promise<(Partial<User> & { id: string })[]> => {
    const search = searchString.toLowerCase();

    // define query
    const query = fetchCollection("users").where('email', '>=', search).where('email', '<=', search + '\uf8ff');
    // const query = fetchCollection("users");
    const snapshot = await query.get();

    // return user objects, making sure id is required
    return snapshot.docs.map((userDoc) => ({ ...userDoc.data(), id: userDoc.id }));
}


export /**
 * Function to fetch all the invited users with a given account
 *
 * @param {string} userEmail
 * @return {*}  {(Promise<(Partial<InvitedUser> & { id: string })[]>)}
 */
const getAllInvitedUsers = async (userEmail: string): Promise<(Partial<InvitedUser> & { id: string })[]> => {
    // get the user
    const user = await getUserWithEmail(userEmail, true);
    if (!user) throw Error(`No user with email ${userEmail}`);

    // get all the invited users
    const querySnapshot = await fetchSubcollection("invited-users", user.id).get();

    return querySnapshot.docs.map((userDoc) => ({ ...userDoc.data(), id: userDoc.id }));
}