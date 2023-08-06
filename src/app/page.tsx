import SignIn from "../components/common/SignIn"
import SignOut from "../components/common/SignOut"

export default function Home() {
  return (
    <main>
      <SignIn/>
      <SignOut/>
      <div>
        <p>
          Hello World :)
        </p>
      </div>
    </main>
  )
}
