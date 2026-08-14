export const emptyPatient: PatientData = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phoneNumber: "",
  email: "",
  address: "",
  preferredLanguage: "",
  nationality: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  religion: ""
};

export type PatientData = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
  preferredLanguage: string;
  nationality: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  religion: string;
};

export type SessionStatus = "active" | "inactive" | "submitted";

export type PatientSession = {
  id: string;
  data: PatientData;
  status: SessionStatus;
  last_activity: string;
  submitted_at: string | null;
  updated_at: string;
};