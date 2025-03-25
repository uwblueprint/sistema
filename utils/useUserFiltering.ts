import { UserAPI } from '@utils/types';
import { useMemo } from 'react';
import { FilterOptions } from '@utils/types';

const useUserFiltering = (
  users: UserAPI[],
  filters: FilterOptions,
  searchTerm: string,
  sortField: string,
  sortDirection: 'asc' | 'desc'
) => {
  const filteredUsers = useMemo(() => {
    return users.filter((user: UserAPI) => {
      const { role, absencesOperator, absencesValue, tags } = filters;

      if (searchTerm) {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        if (!fullName.includes(searchLower)) {
          return false;
        }
      }

      if (role && user.role !== role) {
        return false;
      }

      if (absencesValue !== null && absencesValue !== undefined) {
        const userAbsences = user.absences?.length || 0;

        switch (absencesOperator) {
          case 'greater_than':
            if (userAbsences <= absencesValue) return false;
            break;
          case 'less_than':
            if (userAbsences >= absencesValue) return false;
            break;
          case 'equal_to':
            if (userAbsences !== absencesValue) return false;
            break;
        }
      }

      if (tags && tags.length > 0) {
        const userTags =
          user.mailingLists?.map((list) => list.subject.name) || [];
        if (!tags.some((tag) => userTags.includes(tag))) {
          return false;
        }
      }

      return true;
    });
  }, [users, filters, searchTerm]);

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
          return (a.absences.length - b.absences.length) * modifier;
        case 'role':
          return a.role.localeCompare(b.role) * modifier;
        default:
          return 0;
      }
    });
  }, [filteredUsers, sortField, sortDirection]);

  return { sortedUsers };
};

export default useUserFiltering;
