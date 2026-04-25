/**
 * SharedService — React equivalent of Angular's SharedService
 * Angular: src/app/shared/shared.service.ts
 *
 * Provides item classification and group hierarchy utility functions.
 */

/**
 * Walk up the item classification tree to get all parent nodes.
 * Angular: SharedService.getParents(classId)
 */
export const getClassificationParents = (classId: number, itemClasses: any[]): any[] => {
  const classes: any[] = [];
  if (classId !== 1) {
    let current = classId;
    do {
      const classItem = itemClasses.find((item: any) => item.id === current);
      if (!classItem) break;
      classes.push(classItem);
      current = classItem.parentId || 1;
    } while (current !== 1);
  }
  return classes;
};

/**
 * Recursively collect all child group IDs for a given parent group.
 * Angular: SharedService.getGroupChilds(groupId)
 */
export const getGroupChildren = (groupId: number, groups: any[]): number[] => {
  const childIds: number[] = [];

  const recurse = (id: number) => {
    childIds.push(id);
    const children = groups.filter((g: any) => g.parentId === id);
    children.forEach((child: any) => recurse(child.id));
  };

  recurse(groupId);
  return childIds;
};

/**
 * Check if a groupId exists in any of the groups' subtrees.
 * Angular: SharedService.checkGroupIdExist(groupId, groupsFilter)
 */
export const checkGroupIdExists = (groupId: number, groupsFilter: number[], groups: any[]): boolean => {
  let allGroups: number[] = [];
  groupsFilter.forEach((gId) => {
    allGroups = [...allGroups, ...getGroupChildren(gId, groups)];
  });
  return allGroups.includes(groupId);
};

/**
 * Verify if a group name belongs to any of the specified categories.
 * Angular: appCommon.VerifyGroup
 */
export const verifyGroup = (targetNames: string[], groupName: string, groupList: any[]): boolean => {
  if (!groupName || !groupList?.length) return false;
  const normalizedName = groupName.toLowerCase().trim();

  // Direct name match
  if (targetNames.some((t) => t.toLowerCase().trim() === normalizedName)) return true;

  // Find the group and check ancestors
  const group = groupList.find((g: any) => g.name?.toLowerCase().trim() === normalizedName);
  if (!group) return false;

  // Walk up the parent chain
  let current = group;
  while (current?.parentId) {
    const parent = groupList.find((g: any) => g.id === current.parentId);
    if (!parent) break;
    if (targetNames.some((t) => t.toLowerCase().trim() === parent.name?.toLowerCase()?.trim())) return true;
    current = parent;
  }

  return false;
};
