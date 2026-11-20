import { gql } from './graphql';

/** Campos que la app pide de cada tipo. Coinciden con src/types/domain.ts. */

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    companyId
    fullName
    role
    status
    email
    phoneNumber
    specialty
  }
`;

export const SITE_FIELDS = gql`
  fragment SiteFields on Site {
    id
    name
    address
    latitude
    longitude
    radiusMeters
    isActive
  }
`;

export const TASK_FIELDS = gql`
  fragment TaskFields on Task {
    id
    siteId
    siteName
    assignedToId
    assignedToName
    createdByName
    title
    description
    dueAt
    status
    createdAt
    evidenceCount
  }
`;

export const EVIDENCE_FIELDS = gql`
  fragment EvidenceFields on Evidence {
    id
    clientId
    taskId
    taskTitle
    userId
    userName
    fileUrl
    comment
    capturedAtDevice
    uploadedAt
    reviewStatus
    reviewerName
    reviewerComment
    reviewedAt
  }
`;

export const ATTENDANCE_FIELDS = gql`
  fragment AttendanceFields on Attendance {
    id
    clientId
    userId
    userName
    siteId
    siteName
    type
    capturedAtDevice
    receivedAtServer
    latitude
    longitude
    accuracyMeters
    distanceMeters
    isMocked
    photoUrl
    geofenceStatus
    syncStatus
    requiresReview
    review {
      decision
      verificationMethod
      comment
      reviewerName
      reviewedAt
    }
  }
`;
