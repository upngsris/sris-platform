import type {StructureResolver} from 'sanity/structure'

/**
 * The private records workspace. The first item is the one executives open
 * every day: registrations still waiting for a decision, oldest first, so the
 * 24-hour window is easy to keep.
 */
export const recordsStructure: StructureResolver = (S) =>
  S.list()
    .title('Private records')
    .items([
      S.listItem()
        .title('Registrations awaiting approval')
        .child(
          S.documentList()
            .title('Awaiting approval (oldest first)')
            .filter('_type == "membershipRegistration" && status == "pending"')
            .defaultOrdering([{field: 'submittedAt', direction: 'asc'}]),
        ),

      S.listItem()
        .title('Approved registrations')
        .child(
          S.documentList()
            .title('Approved')
            .filter('_type == "membershipRegistration" && status == "approved"')
            .defaultOrdering([{field: 'reviewedAt', direction: 'desc'}]),
        ),

      S.listItem()
        .title('Rejected registrations')
        .child(
          S.documentList()
            .title('Rejected')
            .filter('_type == "membershipRegistration" && status == "rejected"')
            .defaultOrdering([{field: 'reviewedAt', direction: 'desc'}]),
        ),

      S.divider(),

      S.documentTypeListItem('membershipRegistration').title('All registrations'),
      S.documentTypeListItem('member').title('Members'),

      S.divider(),

      S.documentTypeListItem('contactSubmission').title('Contact enquiries'),
    ])
