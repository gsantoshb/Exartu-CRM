NoteManager = {
  apiAddNote: function(note) {
    // Validation
    if (! note.msg) { throw new Error('Message is required'); }
    if (! note.link) { throw new Error('Link is required'); }

    var contactable = Contactables.findOne(note.link);
    if (!contactable)
      throw new Error('Contactable with id ' + note.link + 'not found');

    // Replace link for corresponding links
    note.links = [{id: note.link, type: Enums.linkTypes.contactable.value}];
    delete note.link;

    return Notes.insert(note);
  }
};
