import { MkdInput } from "../MkdInput";

const AddLevelSkills = () => {
  return (
    <div>
      <MkdInput
        type={"select"}
        name={"name"}
        errors={errors}
        label={"Next Recommended Level"}
        placeholder={""}
        register={register}
        options={recommendation}
        className={"mb-10"}
      />
      <MkdInput
        type={"textarea"}
        name={"name"}
        errors={errors}
        label={"Description"}
        placeholder={""}
        register={register}
        className={"mb-10"}
        rows="5"
      />

      <MkdInput
        type={"select"}
        name={"name"}
        errors={errors}
        label={"Next Recommended Level"}
        placeholder={""}
        register={register}
        options={recommendation}
        className={"mb-10"}
      />
    </div>
  );
};

export default AddLevelSkills;
