import LeftBar from "@/components/shared/LeftBar";
import "../globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="overflow-auto">
      <main className="flex flex-col  min-h-screen bg-neutral-100 px-4  font-dmsans font-medium tracking-tight min-w-[2000px] ">
        <LeftBar />
        <div className="ml-16  ">{children}</div>
      </main>
    </div>
  );
}
