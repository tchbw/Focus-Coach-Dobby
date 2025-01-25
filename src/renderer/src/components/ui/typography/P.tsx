export function TypographyP({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
}
