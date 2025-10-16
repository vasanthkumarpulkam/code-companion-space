# Accessibility Guidelines

## WCAG 2.1 Level AA Compliance

This document outlines the accessibility features implemented in Service HUB and guidelines for maintaining accessibility standards.

## Implemented Features

### 1. Keyboard Navigation
All interactive elements are accessible via keyboard:
- Tab navigation through focusable elements
- Enter/Space to activate buttons and links
- Escape to close dialogs and modals
- Arrow keys for menu navigation

### 2. Screen Reader Support
- All images have descriptive alt text
- ARIA labels on interactive elements
- Proper heading hierarchy (h1-h6)
- Form labels associated with inputs
- Status messages announced to screen readers

### 3. Visual Accessibility
- Color contrast ratios meet WCAG AA standards (4.5:1 for normal text)
- Text resizable up to 200% without loss of functionality
- No reliance on color alone for information
- Focus indicators visible on all interactive elements

### 4. Form Accessibility
- Clear labels for all form inputs
- Error messages associated with inputs
- Required fields clearly marked
- Helpful error messages and validation
- Input types properly set (email, tel, etc.)

### 5. Dynamic Content
- Loading states announced to screen readers
- Error messages properly announced
- Success messages with appropriate roles
- Real-time updates accessible

## Accessibility Checklist

### For Developers

#### HTML Structure
- [ ] Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, etc.)
- [ ] Proper heading hierarchy without skipping levels
- [ ] Lists use `<ul>`, `<ol>`, or `<dl>` tags
- [ ] Tables have proper `<thead>`, `<tbody>`, `<th>` structure

#### Images
- [ ] All images have meaningful alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Complex images have longer descriptions
- [ ] Icons have aria-label when used standalone

#### Forms
```tsx
// Good example
<div>
  <label htmlFor="email">Email Address</label>
  <input 
    id="email" 
    type="email" 
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && <p id="email-error" role="alert">Please enter a valid email</p>}
</div>
```

#### Buttons and Links
```tsx
// Good button
<button aria-label="Close dialog" onClick={handleClose}>
  <X className="h-4 w-4" />
</button>

// Good link
<Link to="/jobs/123" aria-label="View job: House Cleaning">
  View Job
</Link>
```

#### Dialogs and Modals
```tsx
// Good modal
<Dialog 
  open={isOpen} 
  onOpenChange={setIsOpen}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">Confirm Action</DialogTitle>
  <DialogDescription id="dialog-description">
    Are you sure you want to proceed?
  </DialogDescription>
</Dialog>
```

#### Focus Management
```tsx
// Manage focus when opening modals
useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);

// Return focus when closing
const handleClose = () => {
  setIsOpen(false);
  triggerButtonRef.current?.focus();
};
```

#### Skip Links
```tsx
// Add skip link at top of page
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

### For Designers

#### Color Contrast
- Text: Minimum 4.5:1 contrast ratio
- Large text (18pt+): Minimum 3:1 contrast ratio
- UI components: Minimum 3:1 contrast ratio
- Test with tools like WebAIM Contrast Checker

#### Focus Indicators
- Visible focus state on all interactive elements
- High contrast focus indicators
- Consistent focus style across application
- Don't remove focus outlines without replacement

#### Touch Targets
- Minimum 44x44 pixels for touch targets
- Adequate spacing between interactive elements
- Consider mobile and tablet users

#### Typography
- Readable font sizes (minimum 16px for body text)
- Line height of 1.5 for body text
- Adequate letter and word spacing
- Support text resizing up to 200%

## Testing Accessibility

### Automated Testing Tools
1. **axe DevTools** (Browser Extension)
   - Comprehensive accessibility testing
   - Identifies WCAG violations
   - Provides remediation guidance

2. **Lighthouse** (Chrome DevTools)
   - Overall accessibility score
   - Performance and SEO metrics
   - Best practices audit

3. **WAVE** (Browser Extension)
   - Visual feedback on accessibility issues
   - Structural analysis
   - Color contrast checking

### Manual Testing

#### Keyboard Testing
1. Unplug your mouse
2. Use only Tab, Shift+Tab, Enter, Space, Escape, Arrow keys
3. Verify all functionality is accessible
4. Check that focus order is logical

#### Screen Reader Testing
1. **NVDA** (Windows, Free)
   - Download from nvaccess.org
   - Test common user flows
   - Verify announcements are helpful

2. **JAWS** (Windows, Commercial)
   - Industry standard
   - Test if budget allows

3. **VoiceOver** (Mac/iOS, Built-in)
   - Press Cmd+F5 to enable
   - Test navigation and interaction
   - Verify label quality

#### Mobile Testing
1. Enable TalkBack (Android) or VoiceOver (iOS)
2. Test all touch interactions
3. Verify tap target sizes
4. Check pinch-to-zoom functionality

### Testing Checklist
- [ ] All interactive elements keyboard accessible
- [ ] Focus order logical and predictable
- [ ] Focus indicators visible
- [ ] All content accessible to screen readers
- [ ] Form errors clearly announced
- [ ] Color contrast sufficient
- [ ] Images have appropriate alt text
- [ ] Headings properly structured
- [ ] Skip links present and functional
- [ ] Modals trap focus appropriately
- [ ] Live regions work for dynamic content
- [ ] No keyboard traps
- [ ] Zoom up to 200% works without loss

## Common Issues and Solutions

### Issue: Missing Alt Text
**Solution:**
```tsx
// Bad
<img src="/job-image.jpg" />

// Good
<img src="/job-image.jpg" alt="Professional house cleaning service" />

// Good (decorative)
<img src="/decorative-pattern.jpg" alt="" role="presentation" />
```

### Issue: Poor Color Contrast
**Solution:**
- Use design system color tokens
- Test with contrast checker
- Consider dark mode implications

### Issue: Missing Form Labels
**Solution:**
```tsx
// Bad
<input placeholder="Email" />

// Good
<label htmlFor="email">Email Address</label>
<input id="email" type="email" placeholder="you@example.com" />
```

### Issue: Inaccessible Icons
**Solution:**
```tsx
// Bad
<button><TrashIcon /></button>

// Good
<button aria-label="Delete item">
  <TrashIcon aria-hidden="true" />
</button>
```

### Issue: Non-Semantic HTML
**Solution:**
```tsx
// Bad
<div onClick={handleClick}>Click me</div>

// Good
<button onClick={handleClick}>Click me</button>
```

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Learning Resources
- [Web Accessibility Course (Udacity)](https://www.udacity.com/course/web-accessibility--ud891)
- [Accessibility Fundamentals (Deque University)](https://dequeuniversity.com/)
- [Inclusive Components](https://inclusive-components.design/)

## Maintenance

### Regular Audits
- Run automated accessibility tests monthly
- Manual keyboard testing with each major feature
- Screen reader testing for critical flows
- Update documentation as features change

### Training
- New developers complete accessibility training
- Regular team workshops on accessibility topics
- Share accessibility wins and learnings
- Keep team updated on WCAG changes

### User Feedback
- Provide accessible contact methods
- Welcome accessibility feedback
- Prioritize accessibility bug fixes
- Test with users who have disabilities
