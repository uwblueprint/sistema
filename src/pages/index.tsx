import { SignInButton } from "../components/SignInButton";
import { SignOutButton } from "../components/SignOutButton";
import { auth } from "auth";

export default function Index({ session }) {
  return (
  <>
  <SignInButton />
  <br />
  <SignOutButton />
  <br />
  <pre className="py-6 px-4 whitespace-pre-wrap break-all">
    {JSON.stringify(session, null, 2)}
  </pre>
  </>)
  
};

export async function getServerSideProps(ctx) {
  const session = await auth(ctx)
  return {
    props: { session }
  }
}