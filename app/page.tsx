import { Suspense } from "react"
import CarsList from "@/app/components/CarList"



export default function Home() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <CarsList />
    </Suspense>
  )
}
