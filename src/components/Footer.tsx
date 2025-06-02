import React from 'react'
import { Link } from 'react-router-dom'

interface FooterProps {
    version?: string
}

export const Footer: React.FC<FooterProps> = ({ version }) => {
    return (
        <footer className="w-full border-t bg-background py-6 mt-10 text-muted-foreground text-sm">
            <div className="mx-auto max-w-screen-xl px-4 flex flex-col md:flex-row justify-between items-center gap-4">

                {/* Left: Disclaimer */}
                <div className="text-center md:text-left">
                    <p>© {new Date().getFullYear()} File2FA.</p>
                    <p className="text-xs text-muted-foreground">
                        This tool is for reference only and does not constitute financial advice.
                    </p>
                </div>

                {/* Right: Links */}
                <div className="flex flex-wrap justify-center md:justify-end gap-6">
                    <Link to="/about" className="hover:underline">
                        About
                    </Link>
                    <a
                        href="https://github.com/thealakazam/file2fa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                    >
                        GitHub
                    </a>
                    <a
                        href="mailto:contact@file2fa.io"
                        className="hover:underline"
                    >
                        Contact
                    </a>
                </div>
            </div>

            {/* Optional build version */}
            {version && (
                <div className="mt-4 text-center text-xs text-muted-foreground">
                    v{version}
                </div>
            )}
        </footer>
    )
}
