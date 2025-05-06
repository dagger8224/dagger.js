export const load = icons => Promise.all(['sl-avatar', 'sl-input', 'sl-select', 'sl-radio-group'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  avatarName: '',
  avatarList: {
    avatar1: {
      image: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      label: "Avatar 1"
    },
    avatar2: {
      image: "https://images.unsplash.com/photo-1591871937573-74dbba515c4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      label: "Avatar 2"
    },
    avatar3: {
      image: "https://images.unsplash.com/photo-1490150028299-bf57d78394e0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80&crop=right",
      label: "Avatar 3"
    },
    avatar4: {
      image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80",
      label: "Avatar 4"
    },
    avatar5: {
      image: "https://images.unsplash.com/photo-1456439663599-95b042d50252?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80",
      label: "Avatar 5"
    },
    avatar6: {
      image: "https://images.unsplash.com/flagged/photo-1554078875-e37cb8b0e27d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=top&q=80",
      label: "Avatar 6"
    },
    invalid_avatar: {
      image: 'invalid',
      label: 'invalid avatar image url'
    }
  },
  initials: '--',
  icon: 'gear',
  icons: icons.map((icon) => icon.name),
  shape: 'circle',
  loading: 'eager',
  eventType: "N/A"
}));