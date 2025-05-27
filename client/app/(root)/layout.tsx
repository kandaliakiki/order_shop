import LeftBar from "@/components/shared/LeftBar";
import "../globals.css";
import ResponsiveLayout from "@/components/layout_components/MobileHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="overflow-auto">
      <main className="flex flex-col  min-h-screen bg-neutral-100  font-dmsans font-medium tracking-tight  ">
        <LeftBar />

        <div className="md:ml-16 flex flex-col flex-1">{children}</div>
      </main>
    </div>
  );
}
