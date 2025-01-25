export function TypographyH5({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <h4 className="scroll-m-20 text-lg font-semibold tracking-tight">
      {children}
    </h4>
  );
}
