import LeftBar from "@/components/shared/LeftBar";
import "../globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="flex flex-col overflow-auto h-screen bg-neutral-100 px-4  font-dmsans font-medium tracking-tight">
        <div className="min-w-[1400px]">{children}</div>
      </main>
    </>
  );
}
