import { Link, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  CalendarClock,
  Dumbbell,
  HeartPulse,
  Mail,
  MapPin,
  Pencil,
  Phone,
} from 'lucide-react'
import { useStaffMember } from '@/features/staff/hooks/use-staff'
import {
  GENDER_LABELS,
  WEEKDAYS,
  hhmm,
  type StaffRole,
} from '@/features/staff/types/staff'
import { Avatar } from '@/components/ui/avatar'
import { Chip } from '@/components/ui/status-chip'
import { StatusChip } from '@/components/ui/status-chip'
import { Spinner } from '@/components/ui/spinner'
import { Alert } from '@/components/common/alert'
import { ROUTES } from '@/constants/routes'
import { formatDate } from '@/utils/date'

/**
 * The staff record, read-only — the counterpart of member-details.tsx, and the
 * reason `/staff/trainers/4` now opens the person rather than a form.
 *
 * One component for both roles: the two differ only in which professional
 * facts are worth showing, which is a couple of conditionals rather than a
 * second page.
 */
export default function StaffDetailsPage({ role }: { role: StaffRole }) {
  const { id } = useParams<{ id: string }>()
  const staffId = id ? Number(id) : undefined
  const { data: person, isLoading, isError } = useStaffMember(role, staffId)

  const isTrainer = role === 'trainers'
  const listRoute = isTrainer ? ROUTES.TRAINERS : ROUTES.RECEPTIONISTS
  const listLabel = isTrainer ? 'Trainers' : 'Receptionists'

  if (isLoading) {
    return (
      <div className="flex justify-center py-xl">
        <Spinner size="lg" className="text-primary-container" />
      </div>
    )
  }

  if (isError || !person) {
    return <Alert variant="error">Could not load this record.</Alert>
  }

  const editRoute = isTrainer
    ? ROUTES.trainerEdit(person.id)
    : ROUTES.receptionistEdit(person.id)

  const shift = person.shift
  const workingDays = shift?.workingDays ?? []

  return (
    <>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-md">
        <div>
          <nav className="mb-2 font-mono text-label-sm text-on-surface-variant" aria-label="Breadcrumb">
            <Link to={listRoute} className="transition-colors hover:text-primary">{listLabel}</Link>
            <span className="mx-1">/</span>
            <span className="text-on-surface">{person.staffCode}</span>
          </nav>
          <h1 className="text-headline-lg text-on-background">
            {isTrainer ? 'Trainer' : 'Receptionist'} Details
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Profile, shift and {isTrainer ? 'personal training' : 'responsibilities'}.
          </p>
        </div>

        <Link
          to={editRoute}
          className="flex items-center gap-xs rounded-md border border-secondary-container px-md py-2 font-mono text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
        >
          <Pencil className="h-4 w-4" aria-hidden /> Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-lg lg:grid-cols-12">
        {/* Profile */}
        <aside className="lg:col-span-4">
          <div className="card-surface flex flex-col items-center border border-surface-container-highest p-md">
            <Avatar
              name={person.fullName}
              src={person.photoUrl}
              className="mb-4 h-28 w-28 border-4 border-surface text-headline-lg"
            />
            <h2 className="text-headline-md text-on-surface">{person.fullName}</h2>
            <p className="mb-2 font-mono text-label-sm text-on-surface-variant">
              ID: {person.staffCode}
              {person.gender ? ` · ${GENDER_LABELS[person.gender] ?? person.gender}` : ''}
            </p>
            <StatusChip status={person.status} className="mb-md" />

            <dl className="w-full space-y-sm border-t border-surface-container pt-md">
              <Row icon={Phone} value={person.phone} />
              <Row icon={Mail} value={person.email ?? '—'} />
              {person.address && <Row icon={MapPin} value={person.address} />}
              {person.emergencyContactName && (
                <Row
                  icon={HeartPulse}
                  value={`${person.emergencyContactName}${
                    person.emergencyContactPhone ? ` · ${person.emergencyContactPhone}` : ''
                  }`}
                />
              )}
            </dl>
          </div>
        </aside>

        <div className="flex flex-col gap-lg lg:col-span-8">
          {/* Employment */}
          <section className="card-surface border border-surface-container-highest">
            <header className="flex items-center gap-sm border-b border-surface-container px-md py-sm">
              <BadgeCheck className="h-5 w-5 text-primary" aria-hidden />
              <h2 className="text-headline-md text-on-surface">Employment</h2>
            </header>

            <dl className="grid grid-cols-1 gap-md p-md sm:grid-cols-2 xl:grid-cols-4">
              <Fact
                label={isTrainer ? 'Specialization' : 'Job Title'}
                value={(isTrainer ? person.specialization : person.jobTitle) ?? '—'}
              />
              <Fact label="Joined" value={formatDate(person.joiningDate)} />
              <Fact
                label="Experience"
                value={
                  person.experienceYears !== null && person.experienceYears !== undefined
                    ? `${person.experienceYears} year${person.experienceYears === 1 ? '' : 's'}`
                    : '—'
                }
              />
              <Fact label="Date of Birth" value={formatDate(person.dateOfBirth)} />
            </dl>

            {person.qualifications.length > 0 && (
              <div className="border-t border-surface-container px-md py-sm">
                <dt className="mb-2 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Qualifications
                </dt>
                <div className="flex flex-wrap gap-2">
                  {person.qualifications.map((q) => (
                    <span
                      key={q}
                      className="rounded-full bg-surface-container px-3 py-1 font-mono text-label-sm text-on-surface-variant"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {person.notes && (
              <div className="border-t border-surface-container px-md py-sm">
                <dt className="mb-1 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Notes
                </dt>
                <dd className="text-body-md text-on-surface">{person.notes}</dd>
              </div>
            )}
          </section>

          {/* Shift */}
          <section className="card-surface border border-surface-container-highest">
            <header className="flex items-center gap-sm border-b border-surface-container px-md py-sm">
              <CalendarClock className="h-5 w-5 text-primary" aria-hidden />
              <h2 className="text-headline-md text-on-surface">Current Shift</h2>
            </header>

            {shift ? (
              <div className="p-md">
                <dl className="mb-md grid grid-cols-1 gap-md sm:grid-cols-2">
                  <Fact label="Shift" value={shift.shiftName} />
                  <Fact
                    label="Hours"
                    value={
                      shift.startTime && shift.endTime
                        ? `${hhmm(shift.startTime)} – ${hhmm(shift.endTime)}`
                        : 'Flexible'
                    }
                  />
                </dl>

                <dt className="mb-2 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Working Days
                </dt>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((d) => (
                    <span
                      key={d.value}
                      title={d.full}
                      className={
                        workingDays.includes(d.value)
                          ? 'grid h-8 w-8 place-items-center rounded-full bg-primary-container font-mono text-label-sm font-bold text-on-primary'
                          : 'grid h-8 w-8 place-items-center rounded-full bg-surface-container font-mono text-label-sm text-on-surface-variant'
                      }
                    >
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="px-md py-lg text-body-md text-on-surface-variant">
                No shift assigned yet.
              </p>
            )}
          </section>

          {/* Role-specific */}
          {isTrainer ? (
            <section className="card-surface border border-surface-container-highest">
              <header className="flex items-center gap-sm border-b border-surface-container px-md py-sm">
                <Dumbbell className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="text-headline-md text-on-surface">Personal Training</h2>
              </header>
              <div className="p-md">
                <p className="text-display-lg font-bold text-on-surface">{person.ptClientCount}</p>
                <p className="text-body-md text-on-surface-variant">
                  active client{person.ptClientCount === 1 ? '' : 's'}
                </p>
              </div>
            </section>
          ) : (
            person.responsibilities.length > 0 && (
              <section className="card-surface border border-surface-container-highest">
                <header className="flex items-center gap-sm border-b border-surface-container px-md py-sm">
                  <BadgeCheck className="h-5 w-5 text-primary" aria-hidden />
                  <h2 className="text-headline-md text-on-surface">Responsibilities</h2>
                </header>
                <div className="flex flex-wrap gap-2 p-md">
                  {person.responsibilities.map((t) => (
                    <Chip key={t.id} tone="inactive" label={t.name} />
                  ))}
                </div>
              </section>
            )
          )}
        </div>
      </div>
    </>
  )
}

function Row({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  value: string
}) {
  return (
    <div className="flex items-center gap-sm">
      <Icon className="h-4 w-4 shrink-0 text-on-surface-variant" aria-hidden />
      <dd className="truncate text-body-md text-on-surface" title={value}>{value}</dd>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </dt>
      <dd className="text-body-md font-semibold text-on-surface">{value}</dd>
    </div>
  )
}

