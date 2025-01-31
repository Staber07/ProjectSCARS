import { metadata } from "./layout";
import "./page.css";

export default function Home() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <h1 className="text-4xl font-bold text-center sm:text-left">
                    Welcome to <span className="emphasis">{metadata.title}</span>
                </h1>
                <h2 className="text-2xl text-center sm:text-left">{metadata.description}</h2>
            </main>
        </div>
    );
}
