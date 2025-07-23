function FadeSection({ children }: { children: React.ReactNode }) {
  return (
    <div data-aos="fade-up">
      {children}
    </div>
  );
}

export default FadeSection;