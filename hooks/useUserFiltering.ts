import { FilterOptions, UserAPI } from '@utils/types';
import { useMemo } from 'react';
import { NO_EMAIL_TAGS } from '../src/components/dashboard/user_management/FilterPopup';

const useUserFiltering = (
  users: UserAPI[],
  filters: FilterOptions,
  searchTerm: string,
  sortField: string,
  sortDirection: 'asc' | 'desc',
  getSelectedYearAbsences: (absences?: any[]) => number
) => {
  const filteredUsers = useMemo(() => {
    return users.filter((user: UserAPI) => {
      const { role, absencesOperator, absencesValue, disabledTags } = filters;

      if (searchTerm) {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        if (
          !fullName.includes(searchLower) &&
          !user.email.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      if (role && user.role !== role) {
        return false;
      }

      const filteredAbsences = getSelectedYearAbsences(user.absences);

      if (absencesValue !== null && absencesValue !== undefined) {
        switch (absencesOperator) {
          case 'greater_than':
            if (filteredAbsences <= absencesValue) return false;
            break;
          case 'less_than':
            if (filteredAbsences >= absencesValue) return false;
            break;
          case 'equal_to':
            if (filteredAbsences !== absencesValue) return false;
            break;
        }
      }

      if (disabledTags && disabledTags.length > 0) {
        // Get active (non-archived) mailing lists only
        const activeMailingLists =
          user.mailingLists?.filter((list) => !list.subject.archived) || [];

        const userTags = activeMailingLists.map((list) => list.subject.name);

        if (userTags.length === 0) {
          return !disabledTags.includes(NO_EMAIL_TAGS);
        }

        // Include users who have at least one allowed tag
        return userTags.some((tag) => !disabledTags.includes(tag));
      }

      return true;
    });
  }, [users, filters, searchTerm, getSelectedYearAbsences]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'name':
          return (
            `${a.firstName} ${a.lastName}`.localeCompare(
              `${b.firstName} ${b.lastName}`
            ) * modifier
          );
        case 'email':
          return a.email.localeCompare(b.email) * modifier;
        case 'absences':
          const aCount = getSelectedYearAbsences(a.absences);
          const bCount = getSelectedYearAbsences(b.absences);
          return (aCount - bCount) * modifier;
        case 'role':
          return a.role.localeCompare(b.role) * modifier;
        default:
          return 0;
      }
    });
  }, [filteredUsers, sortField, sortDirection, getSelectedYearAbsences]);

  return { sortedUsers };
};

export default useUserFiltering;
