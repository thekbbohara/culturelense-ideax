import { Nav } from '@/components/nav';
import { Dock } from '@/components/dock';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {/* 
        Nav is fixed with h-16/h-20. 
        Usually pages have padding-top to account for fixed header.
        However, Nav component in `home/page.tsx` was just placed there, and `main` had `pt-32` or `pt-20`.
        I should ensure standard spacing here or let pages handle pt.
        The Home page had `pt-32` originally, then `pt-20` for mobile.
        The God page had no pt (but was full screen hero or centered).
        Since God page hero assumes top-of-page, maybe the Nav should overlay?
        Wait, in Home page Nav was fixed with backdrop blur.
        In God page, there was a custom "Back to Home" button on top of the hero image, NO main nav.
        User said "take current nav from home and put it in layout".
        So the MAIN nav should appear on all pages in this layout.
        God page hero might need adjustment to start BELOW the nav, or Nav sits on top.
        Nav has background.
        Let's just render Nav.
      */}
      <div className="pt-20">
        {children}
        <Dock />
      </div>
    </>
  );
}
