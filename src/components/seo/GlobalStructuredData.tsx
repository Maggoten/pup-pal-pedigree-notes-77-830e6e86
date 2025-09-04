import StructuredData, { 
  LocalBusinessSchema, 
  SoftwareApplicationSchema, 
  OrganizationSchema 
} from './StructuredData';

const GlobalStructuredData = () => {
  return (
    <>
      <StructuredData data={LocalBusinessSchema} />
      <StructuredData data={SoftwareApplicationSchema} />
      <StructuredData data={OrganizationSchema} />
    </>
  );
};

export default GlobalStructuredData;