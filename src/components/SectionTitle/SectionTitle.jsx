const SectionTitle = ({ className, text, fontRoboto }) => {
  return (
    <h4
      className={`text-xl font-medium capitalize ${className}`}
      style={{
        fontFamily: `${fontRoboto ? "Roboto" : "Inter"}, sans-serif `,
      }}
    >
      {text}
    </h4>
  );
};

export default SectionTitle;
