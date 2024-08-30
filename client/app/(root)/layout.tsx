import LeftBar from "@/components/shared/LeftBar";
import "../globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="flex flex-col overflow-auto min-h-screen bg-neutral-100 px-4  font-dmsans font-medium tracking-tight content-container">
        <LeftBar />
        <div className="ml-16 mt-5">{children}</div>
      </main>
    </>
  );
}
