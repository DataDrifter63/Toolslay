import clsx from "clsx";

export default function Container({ children, className }) {
  return (
    <div className={clsx("mx-auto w-full max-w-container px-5 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
