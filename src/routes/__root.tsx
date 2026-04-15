import { Outlet, createRootRoute } from "@tanstack/react-router";
import { CustomCategoriesProvider } from '@/hooks/use-custom-categories'
import { Toaster } from 'sonner'
import { CustomizationToggle } from "@/components/customization-toggle";

export const Route = createRootRoute({
    component: () => (
        <CustomCategoriesProvider>
            <Outlet />
            <Toaster richColors position="top-center" />
            <div className="fixed bottom-6 right-6 z-50">
                <CustomizationToggle />
            </div>
        </CustomCategoriesProvider>
    ),
});
