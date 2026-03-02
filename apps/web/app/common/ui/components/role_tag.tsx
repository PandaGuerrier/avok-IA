import RoleDto from '#users/dtos/role'

export default function RoleTag({ role }: { role: RoleDto }) {
  return (
    <span
      className="inline-block  px-2 py-1 text-xs font-medium rounded-md border scale-75 md:scale-100"
      style={{
        borderColor: role.tagColor || 'FFFFFF',
        color: role.tagColor || 'FFFFFF',
        backgroundColor: `${role.tagColor}15`
      }}
    >
      {role.tag}
    </span>
  )
}
