import Profile from "@/components/forms/Profile";
import { getUserById } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs";

const EditProfile = async () => {
  const { userId } = auth();

  if (!userId) return null;

  const mongoUser = await getUserById({ userId });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      <div className="mt-9">
        <Profile clerkId={userId} mongoUser={JSON.stringify(mongoUser)} />
      </div>
    </>
  );
};

export default EditProfile;
