import { UserAPI } from '@utils/types';
import { useMemo } from 'react';
import { FilterOptions } from '@utils/types';
import { NO_EMAIL_TAGS } from '../src/components/FilterPopup';

const useUserFiltering = (
  users: UserAPI[],
  filters: FilterOptions,
  searchTerm: string,
  sortField: string,
  sortDirection: 'asc' | 'desc'
) => {
  const filteredUsers = useMemo(() => {
    // We need to know how many tags exist in total
    const allAvailableTags = new Set<string>();
    users.forEach((user) => {
      user.mailingLists?.forEach((list) => {
        allAvailableTags.add(list.subject.name);
      });
    });
    const totalTagCount = allAvailableTags.size;
    const areAllTagsDisabled = filters.disabledTags?.length === totalTagCount;

    return users.filter((user: UserAPI) => {
      const { role, absencesOperator, absencesValue, disabledTags } = filters;

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

      if (disabledTags && disabledTags.length > 0) {
        const userTags =
          user.mailingLists?.map((list) => list.subject.name) || [];

        // Check if user has no subscriptions
        if (userTags.length === 0) {
          // Only show users with no subscriptions if the "No Email Tags" option is enabled
          return !disabledTags.includes(NO_EMAIL_TAGS);
        }

        // For users with subscriptions, check if they have any enabled tag
        return userTags.some((tag) => !disabledTags.includes(tag));
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
