import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top of the window
        window.scrollTo(0, 0);

        // Also handle internal scroll containers if any (like AdminLayout's scrollable div)
        const scrollContainers = document.querySelectorAll('.overflow-y-auto');
        scrollContainers.forEach(container => {
            container.scrollTop = 0;
        });
    }, [pathname]);

    return null;
};
