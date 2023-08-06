import Skeleton from "../components/auth/Skeleton"
import SignIn from "../components/common/SignIn"
import SignOut from "../components/common/SignOut"

export default async function Home() {
  return (
    <main>
      <Skeleton>
        <SignIn/>
        <SignOut/>
        <div>
          <p>
            Hello World :)
          </p>
        </div>
      </Skeleton>
    </main>
  )
}
