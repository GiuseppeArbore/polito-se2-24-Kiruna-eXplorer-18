

import { useToast } from "../../utils/toaster"

import { Toast, ToastProvider, ToastViewport } from "./Toast"

const Toaster = () => {
    const { toasts } = useToast()

    return (
        <ToastProvider swipeDirection="right">
            {toasts.map(({ id, ...props }) => {
                return <Toast key={id} {...props} />
            })}
            <ToastViewport />
        </ToastProvider>
    )
}

export { Toaster }