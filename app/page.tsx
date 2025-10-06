import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="text-blue-600">BrightNest</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover your financial personality and get personalized insights 
            to help you build a brighter financial future.
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Choose Your Quiz
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left mb-8">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Profile</h3>
                <p className="text-gray-600 mb-4">Discover your overall financial personality and get personalized insights.</p>
                <Link href="/quiz/financial-profile" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                  Take Quiz
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Finance</h3>
                <p className="text-gray-600 mb-4">Learn how to manage healthcare costs and plan for medical expenses.</p>
                <Link href="/quiz/health-finance" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                  Take Quiz
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Marriage Finance</h3>
                <p className="text-gray-600 mb-4">Navigate financial decisions as a couple and build shared goals.</p>
                <Link href="/quiz/marriage-finance" className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                  Take Quiz
                </Link>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What You&apos;ll Discover
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Your Financial Archetype</h3>
                  <p className="text-gray-600">Learn whether you&apos;re a Debt Crusher, Savings Builder, Stability Seeker, or Optimizer</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Personalized Insights</h3>
                  <p className="text-gray-600">Get tailored advice based on your financial personality and goals</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Actionable Steps</h3>
                  <p className="text-gray-600">Receive specific recommendations to improve your financial health</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick & Easy</h3>
                  <p className="text-gray-600">Complete our quiz in just 5 minutes and get instant results</p>
                </div>
              </div>
            </div>
          </div>
          
          <Link
            href="/quiz"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Your Financial Quiz
          </Link>
          
          <p className="text-sm text-gray-500 mt-4">
            Takes less than 5 minutes • No signup required • Instant results
          </p>
        </div>
      </div>
    </div>
  );
}