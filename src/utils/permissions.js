export function getPermissions(role) {
  switch (role) {
    case 'client':
      return {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canApprove: true,
        canUpdateStatus: true,
        canComment: true,
        canManageUsers: true,
        canShareUrls: true,
        seeAllTeams: true,
      }
    case 'work_manager':
      return {
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canApprove: false,
        canUpdateStatus: true,
        canComment: true,
        canManageUsers: false,
        canShareUrls: true,
        seeAllTeams: true,
      }
    case 'engineer':
      return {
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canApprove: false,
        canUpdateStatus: true,
        canComment: true,
        canManageUsers: false,
        seeAllTeams: false,
      }
    default:
      return {
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canApprove: false,
        canUpdateStatus: false,
        canComment: false,
        canManageUsers: false,
        seeAllTeams: false,
      }
  }
}
