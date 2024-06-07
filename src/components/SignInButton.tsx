// import { signInWithGoogle } from './serverActions';
// import { signIn } from "auth";


// export function SignInButton() {
//   return (
//       // <form method="post" action="./app/auth/[...nextauth]/route.ts">  
//       //     <button type="submit">Sign in with Google</button>
//       // </form>
//       <button onClick={async () => {
//         await signIn()
//       }}>Hello World!</button>
//   );
// }


import { signIn } from "next-auth/react"
 
export function SignInButton() {
  return <button onClick={() => signIn("google" , {redirectTo: "/index"})}>Sign In Google</button>
}