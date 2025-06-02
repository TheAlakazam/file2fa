import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const HomePage = () => {
    return (
        <div className="space-y-16">

            {/* Hero Section */}
            <section className="text-center max-w-3xl mx-auto mt-12 px-4">
                <h1 className="text-4xl font-bold mb-4">Convert Your E*TRADE Statements to Schedule FA</h1>
                <p className="text-muted-foreground text-lg mb-6">
                    File2FA helps you quickly prepare Schedule FA entries from your brokerage transactions. Clean. Private. Instant.
                </p>
                <Link to="/upload">
                    <Button size="lg">Get Started</Button>
                </Link>
            </section>

            {/* Visual Flow / Mockup Images */}
            <section className="flex flex-col gap-8 items-center px-4">
                <img src="https://picsum.photos/800/400" alt="Upload Flow" className="rounded-xl shadow w-full max-w-4xl" />
                <img src="https://picsum.photos/1000/600" alt="Processed Table" className="rounded-xl shadow w-full max-w-4xl" />
            </section>

            {/* How It Works */}
            <section className="max-w-3xl mx-auto px-4">
                <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-base">
                    <li>Upload your E*TRADE transaction PDF or CSV</li>
                    <li>We extract relevant foreign asset details locally</li>
                    <li>You review the auto-generated Schedule FA table</li>
                    <li>Copy & file it in your ITR with confidence</li>
                </ul>
            </section>

            {/* Disclaimer */}
            <section className="max-w-2xl mx-auto text-center px-4 text-sm text-muted-foreground">
                <p>
                    This tool is designed for reference only and does not constitute legal or financial advice. No data is uploaded or stored — all processing is done on your device.
                </p>
            </section>
        </div>
    )
}

export default HomePage
