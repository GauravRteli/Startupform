import React from "react";
import WealthGrading from "./WealthGrading";
import InnovationGrading from "./InnovationGrading";
import EmploymentCreation from "./EmploymentCreation";

export default function BroadParameters({
  values,
  onChange,
  isEditMode = false,
  hasExistingDocument,
  getDocumentUrl,
}) {
  return (
    <div className="space-y-6 text-left">
      <InnovationGrading
        values={values}
        onChange={onChange}
        isEditMode={isEditMode}
        hasExistingDocument={hasExistingDocument}
        getDocumentUrl={getDocumentUrl}
      />
      <WealthGrading
        values={values}
        onChange={onChange}
        isEditMode={isEditMode}
        hasExistingDocument={hasExistingDocument}
        getDocumentUrl={getDocumentUrl}
      />
      <EmploymentCreation
        values={values}
        onChange={onChange}
        isEditMode={isEditMode}
        hasExistingDocument={hasExistingDocument}
        getDocumentUrl={getDocumentUrl}
      />
    </div>
  );
}
